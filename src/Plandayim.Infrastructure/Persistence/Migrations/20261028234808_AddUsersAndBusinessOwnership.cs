using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Plandayim.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddUsersAndBusinessOwnership : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<long>(
                name: "OwnerUserId",
                table: "Businesses",
                type: "bigint",
                nullable: true);

            migrationBuilder.AddColumn<long>(
                name: "ApplicantUserId",
                table: "BusinessApplications",
                type: "bigint",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "Users",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    FullName = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    Email = table.Column<string>(type: "nvarchar(254)", maxLength: 254, nullable: false),
                    PasswordHash = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    LastLoginAtUtc = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CreatedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Users", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Businesses_OwnerUserId",
                table: "Businesses",
                column: "OwnerUserId");

            migrationBuilder.CreateIndex(
                name: "IX_BusinessApplications_ApplicantUserId",
                table: "BusinessApplications",
                column: "ApplicantUserId");

            migrationBuilder.CreateIndex(
                name: "IX_Users_Email",
                table: "Users",
                column: "Email",
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "FK_BusinessApplications_Users_ApplicantUserId",
                table: "BusinessApplications",
                column: "ApplicantUserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Businesses_Users_OwnerUserId",
                table: "Businesses",
                column: "OwnerUserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_BusinessApplications_Users_ApplicantUserId",
                table: "BusinessApplications");

            migrationBuilder.DropForeignKey(
                name: "FK_Businesses_Users_OwnerUserId",
                table: "Businesses");

            migrationBuilder.DropTable(
                name: "Users");

            migrationBuilder.DropIndex(
                name: "IX_Businesses_OwnerUserId",
                table: "Businesses");

            migrationBuilder.DropIndex(
                name: "IX_BusinessApplications_ApplicantUserId",
                table: "BusinessApplications");

            migrationBuilder.DropColumn(
                name: "OwnerUserId",
                table: "Businesses");

            migrationBuilder.DropColumn(
                name: "ApplicantUserId",
                table: "BusinessApplications");
        }
    }
}
